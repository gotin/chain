class StaticController < ApplicationController
  def index
  end

  def test1
    render layout: false
  end

  def test2
    render layout: false
  end
end
