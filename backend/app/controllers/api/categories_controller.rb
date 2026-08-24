class Api::CategoriesController < ApplicationController
  def index
    categories = Category.order(:name)
    render json: categories
  end

  def create
    name = params[:name].to_s.strip
    if name.blank?
      render json: { errors: ["Name can't be blank"] }, status: :unprocessable_entity
      return
    end

    category = Category.find_or_create_by(name: name)

    # If a new record was created by this call, previous_changes will include 'id'
    status = category.previous_changes.key?("id") ? :created : :ok
    render json: category, status: status
  end
end
