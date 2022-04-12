OpenProject::Application.configure do
  config.assets.precompile += %w(
    favicon.png
    locales/*.js
  )
end
