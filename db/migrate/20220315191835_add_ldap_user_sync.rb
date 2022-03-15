class AddLdapUserSync < ActiveRecord::Migration[6.1]
  def up
    add_column :auth_sources, :user_mode, :integer, null: false, default: 0
    AuthSource.where(onthefly_register: true).update_all(user_mode: LdapAuthSource.user_modes[:onthefly_register])
    remove_column :auth_sources, :onthefly_register
  end

  def down
    add_column :auth_sources, :onthefly_register, :boolean, null: false, default: false
    AuthSource.where(user_mode: :synchronize).update_all(onthefly_register: true)
    remove_column :auth_sources, :user_mode
  end
end
