require 'test_helper'

class StaticControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get test1" do
    get :test1
    assert_response :success
  end

  test "should get test2" do
    get :test2
    assert_response :success
  end

end
