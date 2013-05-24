class Location
  include Mongoid::Document
  include Geocoder::Model::Mongoid

  field :street, type: String
  field :postal_code, type: String
  field :city, type: String
  field :country, type: String
  field :coordinates, type: Array

  belongs_to :user

  attr_accessible :street, :city, :country, :user, :coordinates


  geocoded_by :formatted_addr
  after_validation :geocode

  def formatted_addr
    [street, postal_code, city, country].join(' ')
  end

end
