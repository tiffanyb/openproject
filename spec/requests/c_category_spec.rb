require 'rails_helper'

RSpec.describe "CCategories", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/c_category/index"
      expect(response).to have_http_status(:success)
    end
  end

end
