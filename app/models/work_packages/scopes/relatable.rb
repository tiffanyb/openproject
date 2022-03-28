#  OpenProject is an open source project management software.
#  Copyright (C) 2010-2022 the OpenProject GmbH
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License version 3.
#
#  OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
#  Copyright (C) 2006-2013 Jean-Philippe Lang
#  Copyright (C) 2010-2013 the ChiliProject Team
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License
#  as published by the Free Software Foundation; either version 2
#  of the License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
#  See COPYRIGHT and LICENSE files for more details.

module WorkPackages::Scopes
  module Relatable
    extend ActiveSupport::Concern

    class_methods do
      def relatable(work_package, relation_type)
        return all if work_package.new_record?

        scope = not_having_directed_relation(work_package, relation_type)
                  .not_having_direct_relation(work_package)
                  .where.not(id: work_package)

        if Setting.cross_project_work_package_relations
          scope
        else
          scope.where(project: work_package.project)
        end
      end

      def not_having_direct_relation(work_package)
        where.not(id: Relation.where(from: work_package).select(:to_id))
             .where.not(id: Relation.where(to: work_package).select(:from_id))
      end

      def not_having_directed_relation(work_package, relation_type)
        sql = <<~SQL.squish
          WITH
            RECURSIVE
            #{non_relatable_paths_sql(work_package, relation_type)}

            SELECT id
            FROM #{related_cte_name}
        SQL

        scope = where("work_packages.id NOT IN (#{sql})")

        if relation_type == Relation::TYPE_HIERARCHY
          # Explicitly allow ancestors except the parent.
          # This only works because an ancestor cannot be already linked to its work package.
          # The #parent_id field of the work package cannot be trusted at this point since it might have
          # an unpersisted change.
          ancestors_without_parent = WorkPackageHierarchy
                                       .where(descendant_id: work_package.id)
                                       .where('generations > 1')

          scope
            .or(where(id: ancestors_without_parent.select(:ancestor_id)))
        else
          scope
        end
      end

      private

      def non_relatable_paths_sql(work_package, relation_type)
        <<~SQL.squish
          #{related_cte_name} (id, from_hierarchy) AS (

              #{non_recursive_relatable_values(work_package)}

            UNION

              SELECT
                relations.id,
                relations.from_hierarchy
              FROM
                #{related_cte_name}
              JOIN LATERAL (
                #{joined_existing_connections(relation_type)}
              ) relations ON 1 = 1
          )
        SQL
      end

      def non_recursive_relatable_values(work_package)
        sql = <<~SQL.squish
          SELECT * FROM (VALUES(:id, false)) AS t(id, from_hierarchy)
        SQL

        ::OpenProject::SqlSanitization
          .sanitize sql,
                    id: work_package.id
      end

      def joined_existing_connections(relation_type)
        unions = [existing_hierarchy_lateral]

        if relation_type != Relation::TYPE_RELATES
          unions << existing_relation_of_type_lateral(relation_type)
        end

        unions.join(' UNION ')
      end

      def existing_relation_of_type_lateral(relation_type)
        # In case a 'hierarchy' is queried for, when it comes to relations,
        # it is in fact relations of type 'follows' that are of interest
        # which is why they are switched for here.
        # Otherwise, the canonical type has to be used as that is the only one
        # that is stored in the database.
        canonical_type = if relation_type == Relation::TYPE_HIERARCHY
                           Relation::TYPE_FOLLOWS
                         else
                           Relation.canonical_type(relation_type)
                         end

        direction1, direction2 = if canonical_type == relation_type
                                   %w[from_id to_id]
                                 else
                                   %w[to_id from_id]
                                 end

        sql = <<~SQL.squish
          SELECT
            #{direction1} id,
            false from_hierarchy
          FROM
            relations
          WHERE (relations.#{direction2} = #{related_cte_name}.id AND relations.relation_type = :relation_type)
        SQL

        ::OpenProject::SqlSanitization
          .sanitize sql,
                    relation_type: canonical_type
      end

      def existing_hierarchy_lateral
        <<~SQL.squish
          SELECT
            CASE
              WHEN work_package_hierarchies.ancestor_id = related.id
              THEN work_package_hierarchies.descendant_id
              ELSE work_package_hierarchies.ancestor_id
              END id,
            true from_hierarchy
          FROM
            work_package_hierarchies
          WHERE
            #{related_cte_name}.from_hierarchy = false AND
            (work_package_hierarchies.ancestor_id = #{related_cte_name}.id OR work_package_hierarchies.descendant_id = #{related_cte_name}.id)
        SQL
      end

      def related_cte_name
        'related'
      end
    end
  end
end
