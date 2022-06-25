class CreateCCategories < ActiveRecord::Migration[6.1]
  def change
    create_table :c_categories do |t|
      t.string :title
      t.belongs_to :project, default: 0, null: false, type: :int
      t.text :description

      # belongs_to
      t.integer :author_id, default: 0, null: false

      t.timestamps
    end
  end
end
