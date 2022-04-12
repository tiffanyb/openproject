# Enables communication with CodiMD

require 'uri'
require 'net/http'
require 'nokogiri'

ENDPOINT = 'http://localhost:8080/codimd/'

class CodiMD
  class << self
    def reg_user email, pwd
      res = Net::HTTP.post_form(URI(ENDPOINT + 'register'), 'email' => email, 'password' => pwd)
      return false unless res.code == "302"
      res = Net::HTTP.get_response(URI(ENDPOINT), { 'Cookie' => res['Set-Cookie'] })
      return false unless res.code == "200"
      tags = Nokogiri::HTML.parse(res.body).search('div[class="alert alert-info"]')
      return false unless tags.length == 1
      text = tags[0].children[0].text
      return false unless text.match(/successfully/)
      true
    end

    def login_user email, pwd
      res = Net::HTTP.post(URI(ENDPOINT + 'login'), URI.encode_www_form({'email' => email, 'password' => pwd}),
                           { 'Referer' => ENDPOINT,
                             'Content-Type' => 'application/x-www-form-urlencoded',
      })
      return false unless res.code == "302"
      cookie = res['Set-Cookie']
      res = Net::HTTP.get_response(URI(ENDPOINT), { 'Cookie' => cookie })
      return false unless res.code == "200"
      tags = Nokogiri::HTML.parse(res.body).search('div[class="alert alert-danger"]')
      return cookie unless tags.length != 0
      false
    end

    def new_note cookie, content
      res = Net::HTTP.post(URI(ENDPOINT + 'new'), content,
                           { 'Cookie' => cookie,
                             'Content-Type' => 'text/plain',
      })
      return false unless res.code == '302'
      res['Location'].split('/').last
    end
  end 
end
