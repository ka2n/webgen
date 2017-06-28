import * as markdownHelper from 'markdown-it'


export const markdown = (input: string): string => {
    return markdownHelper().render(input)
}