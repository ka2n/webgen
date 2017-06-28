# webgen

Generate static site from Pug(jade) templates and contents from [Contentful](https://www.contentful.com).

## Usage

First, on Contentful, create a space with models like this,

Content model

```json
{
  "name": "Post",
  "displayField": "title",
  "fields": [
    {
      "id": "title",
      "name": "Title",
      "type": "Text",
      "localized": false,
      "required": true,
      "validations": [],
      "disabled": false,
      "omitted": false
    },
    {
      "id": "slug",
      "name": "Slug",
      "type": "Symbol",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false
    },
    {
      "id": "body",
      "name": "Body",
      "type": "Text",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false
    }
  ]
}
```

Example content

```json
{
    "fields" {
        "name": "First post",
        "slug": "first_post",
        "body": "**Hello world**"
    }
}
```

Create project directory and place a template,

```sh
$ mkdir proj && cd proj
$ echo -e 'h1 #{entry.fields.title}\n!= markdown(entry.fields.body)' > post.pug
```

To generate assets,

```sh
$ webgen build -a <Contentful: AccessToken> -s <Contentful: Space ID> -t ./ -o ./out
$ cat out/post/first_post/index.html
<h1>First post</h1><strong>Hello world</strong>
```

### Filters and helpers

#### helpers

- `!= markdown("# Hello")` : render markdown string

## Project Status

Please note this project is very very pre alpha quality

- [ ] HTTP server with on-demand rendering
- [ ] Fetch media to local filesystem
- [ ] More helpers