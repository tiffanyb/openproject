class CCategoryController < ApplicationController
  include QueriesHelper
  include PaginationHelper
  include Layout

  before_action :find_project_by_project_id

  include CellsHelper

  def index
    set_index_data!

    respond_to do |format|
      format.html do
        render :index
      end
      
      format.all do 
        head :not_acceptable
      end
    end 
  end

  # TODO: Use contract/services instead of models directly
  def create
    cc = CCategory.new
    cc.title = params[:title]
    cc.author = User.current
    @project.c_categories.append cc 

    # add entries


    cc.save

    redirect_to action: 'index'
  end 

  def show
    respond_to do |format|
      format.html do
        render :show 
      end 

      format.all do
        head :not_acceptable
      end 
    end
  end 

  # TODO: Delete, Update

  def set_index_data!
    @c_categories = Queries::CCategory::CCategoryQuery.new
    @c_categories.where(:project_id, '=', @project.id)
  end
end
