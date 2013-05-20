# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

puts 'SETTING UP DEFAULT USER LOGIN'
user = User.create! :UserName => 'User1', :email => 'tw.prostyadres@gmail.com', :password => 'difficult', :password_confirmation => 'difficult'
puts 'New user created: ' << user.UserName
user2 = User.create! :UserName => 'User2', :email => 'tomaszwoz@yahoo.com', :password => '12345678', :password_confirmation => '12345678'
puts 'New user created: ' << user2.UserName