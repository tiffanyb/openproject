class CCategory < ApplicationRecord
    has_many :c_category_fields

    belongs_to :author, class_name: "User", foreign_key: "author_id"

    def project
        Project.find_by(id: project_id)        
    end
end
