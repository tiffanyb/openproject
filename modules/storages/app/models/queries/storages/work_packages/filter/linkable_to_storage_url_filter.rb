#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2022 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

module Queries::Storages::WorkPackages::Filter
  class LinkableToStorageUrlFilter < ::Queries::WorkPackages::Filter::WorkPackageFilter
    def type
      :list
    end

    def allowed_values
      # Allow all input values that are given to the filter.
      # If no result is found, an empty collection is returned.
      values.map { |value| [nil, value] }
    end

    def where
      canonical_url_values = values.map { |value| CGI.unescape(value).gsub(/\/+$/, '') }

      <<-SQL.squish
        #{::Queries::Operators::Equals.sql_for_field(canonical_url_values, ::Storages::Storage.table_name, 'host')}
        AND work_packages.project_id IN (#{Project.allowed_to(User.current, :manage_file_links).select(:id).to_sql})
      SQL
    end

    def joins
      :storages
    end
  end
end