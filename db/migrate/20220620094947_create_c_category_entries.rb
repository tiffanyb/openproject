class CreateCCategoryEntries < ActiveRecord::Migration[6.1]
  def change
    create_table :c_category_entries do |t|
      t.string :name
      t.text :value
      t.belongs_to :work_package, null: false, type: :int

      t.timestamps
    end
  end
end
