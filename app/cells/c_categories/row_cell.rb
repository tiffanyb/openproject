module CCategories
  class RowCell < ::RowCell
    include AvatarHelper
    include UsersHelper

    def author
      icon = avatar model.author, size: :mini 
      
      icon + author_link
    end 

    def author_link
      link_to model.author.name, author_link_path
    end

    def author_link_path
      case model.author
      when User
        user_path(model.author)
      when Group
        show_group_path(model.author)
      else
        placeholder_user_path(model.author)
      end 
    end 
  end
end 