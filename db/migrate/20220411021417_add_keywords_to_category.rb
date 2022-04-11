class AddKeywordsToCategory < ActiveRecord::Migration[6.1]
  def change
    add_column :categories, :keywords, :text, array: true, default: []
  end
end
