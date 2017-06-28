require 'thor'
require './lib/web/builder'

class Web < Thor
    desc "build", "build task"
    def build
        builder = Builder.new
        builder.exec
    end
end