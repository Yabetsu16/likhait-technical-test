class Api::ExpensesController < ApplicationController
  def index
    # Order by expense date descending (fallback to created_at when date is NULL), so newly created expenses are placed according to their expense date.
    expenses = Expense.includes(:category).order(Arel.sql("COALESCE(date, created_at) DESC, created_at DESC"))

    if params[:year].present? && params[:month].present?
      year = params[:year].to_i
      month = params[:month].to_i

      start_date = Date.new(year, month, 1)
      end_date = start_date.end_of_month

      expenses = expenses.where(created_at: start_date.beginning_of_day..end_date.end_of_day)
    end

    render json: expenses.map { |expense| format_expense(expense) }
  end

  def create
    expense = Expense.new(expense_params)

    if expense.save
      render json: format_expense(expense), status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    expense = Expense.find(params[:id])

    if expense.update(expense_params)
      render json: format_expense(expense)
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    expense = Expense.find(params[:id])
    expense.destroy
    head :no_content
  end

  private

  def expense_params
    # permit payer_name so frontend-submitted payer is saved (DB has NOT NULL constraint)
    params.require(:expense).permit(:description, :amount, :category_id, :date, :payer_name)
  end

  def format_expense(expense)
    {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.to_f,
      category: expense.category.name,
      payer_name: expense.payer_name,
      date: expense.date.to_s,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    }
  end
end
