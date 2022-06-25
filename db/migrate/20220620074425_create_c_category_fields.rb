class CreateCCategoryFields < ActiveRecord::Migration[6.1]
  def change
    create_table :c_category_fields do |t|
      t.string :name
      t.belongs_to :c_category, null: false, type: :int

      t.timestamps
    end
  end
end
