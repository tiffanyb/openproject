module Ldap
  class SynchronizeUsersService
    attr_reader :ldap, :synced_groups

    def initialize(ldap)
      @ldap = ldap
    end

    def call
      OpenProject::Mutex.with_advisory_lock_transaction(ldap) do
        synchronize!
      end
      ServiceResult.new(success: true)
    rescue StandardError => e
      error = "[LDAP Sync] Failed to synchronize users of #{ldap.name}: #{e.class}: #{e.message}"
      Rails.logger.error(error)
      ServiceResult.new(message: error, success: false)
    end

    def synchronize!
      ldap_con = ldap.instance_eval { initialize_ldap_con(account, account_password) }

      found = []
      find_users(ldap_con) do |attributes|
        user = User.find_by_login(attributes[:login])

        if user
          found << user.id
          try_to_update(user, attributes)
        else
          id = create_missing!(attributes)
          found << id unless id.nil?
        end
      end

      lock_not_found(found)
    end

    ##
    # Lock all users not found in the synchronization job
    def lock_not_found(found_ids)
      return if found_ids.empty?

      User
        .where(auth_source_id: ldap.id)
        .where.not(id: found_ids)
        .update_all(status: Principal.statuses[:locked])

      Rails.logger.info do
        user_names = User.where(id: found_ids).pluck(:login)
        "[LDAP user sync] Locked #{found_ids.count} users as they could not be found: #{user_names.join(', ')}"
      end
    end

    ##
    # Create missing user from ldap data
    # checking their user limit once to prevent spamming the log with limits
    def create_missing!(attributes)
      if OpenProject::Enterprise.user_limit_reached?
        @user_limit_logged ||= begin
          Rails.logger.error("[LDAP user sync] User '#{user.login}' could not be created as user limit exceeded.")
          true
        end

        return
      end

      try_to_create(attributes)
    end

    # Try to create the user from attributes
    def try_to_create(attrs)
      call = Users::CreateService
        .new(user: User.system)
        .call(attrs)

      if call.success?
        Rails.logger.info("[LDAP user sync] User '#{call.result.login}' created")
        call.result.id
      else
        Rails.logger.error("[LDAP user sync] User '#{attrs['login']}' could not be created: #{call.message}")
        nil
      end
    end

    # Try to create the user from attributes
    def try_to_update(user, attrs)
      call = Users::UpdateService
        .new(model: user, user: User.system)
        .call(attrs)

      if call.success?
        Rails.logger.info("[LDAP user sync] User '#{call.result.login}' updated")
      else
        Rails.logger.error("[LDAP user sync] User '#{user.login}' could not be updated: #{call.message}")
      end
    end

    def find_users(ldap_con)
      # Get user login attribute and base dn which are private
      base_dn = ldap.base_dn

      search_attributes = ldap.search_attributes(true)
      ldap_con.search(base: base_dn,
                      filter: ldap_filter,
                      attributes: search_attributes) do |entry|
        data = ldap.get_user_attributes_from_ldap_entry(entry)
        yield data.except(:dn)
      end
    end

    def ldap_filter
      # Add the LDAP auth source own filter if present
      if ldap.filter_string.present?
        ldap.parsed_filter_string
      end
    end
  end
end
