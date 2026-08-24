class Expense < ApplicationRecord
  belongs_to :category

  # Ensure an expense has a date and that date is not in the future.
  validates :date, presence: true
  validate :date_cannot_be_in_the_future

  private

  def date_cannot_be_in_the_future
    return if date.blank?

    if date > Date.current
      errors.add(:date, "can't be in the future")
    end
  end
end
