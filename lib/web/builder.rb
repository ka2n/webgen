require 'bundler'
Bundler.require

class Builder
    def initialize()
    end

    def exec
        cnf = {
            author: {
                base: :authors,
                slug: :name,
                slug_transform: :snakecase
            }
        }

        client = Contentful::Client.new(access_token: ENV['CONTENTFUL_TOKEN'], space: ENV['CONTENTFUL_SPACE'])
        client.content_types.each do |type|
            type_name = type.name.downcase
            ccnf = cnf[type_name.to_sym] || {}

            template_paths = []
            template_paths << ccnf[:template] if ccnf[:template].present?
            template_paths << type_name + ".slim"

            client.entries(content_type: type.id).each do |entry|

                slug = ccnf[:slug] && entry.fields[ccnf[:slug]] || entry.fields[:slug] || entry.id
                
                if ccnf[:slug_transform]
                    transformer = "transform_#{ccnf[:slug_transform]}".to_sym
                    slug = try(transformer, slug) || slug
                end

                output_path = "#{ccnf[:base] || type.name.downcase}/#{slug}"
                templates = template_paths.dup
                templates << type_name + "_" + slug + ".slim"
                templates << type_name + "_" + entry.id + ".slim"

                readable_tmpl = templates.select(&File.method(:readable?))
                unless readable_tmpl.present?
                    fail "No template found: #{templates.join(", ")}"
                end
                tmpl = readable_tmpl.first

                helper = TemplateHelper.new
                output = Slim::Template.new(tmpl, {}).render(helper, { entry: entry.fields })

                final_output_dir = "./dist/" + output_path
                FileUtils.mkdir_p final_output_dir
                open(final_output_dir + "/index.html", "w") do |f|
                    f.write output
                end
                p "Generated: #{output_path} from #{tmpl}"
            end
        end
        # パスのルールを決める
        # モデルを読み込む
        # モデルに従ってテンプレート名のマッピングをする
        #    Entry
        #       -> entry_<slug>.slim
        #       -> entry.slim
        #    Page
        #       -> page_<slug>.slim
        #       -> page.slim
        # URLとハンドラーを生成する
        # Webの場合:
        #   shinatoraにマウントする
        # Staticの場合:
        #   各ハンドラーをイテーレートして出力先ディレクトリに書き出す
    end

    private

    def transform_snakecase(input)
        input.snakecase
    end

    class TemplateHelper
        def markdown(text)
            rc = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
            rc.render(text)
        end
    end
end