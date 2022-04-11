class AddCategoryDescriptionToWorkPackage < ActiveRecord::Migration[6.1]
  def change
    add_column :work_packages, :category_description, :string
  end
end
