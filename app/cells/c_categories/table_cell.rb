module CCategories
  class TableCell < ::TableCell
    columns :title, :author 

    def initial_sort
      %i[title asc]
    end

    def empty_row_message
      "No categories"
    end
  end
end
