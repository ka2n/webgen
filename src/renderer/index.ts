import { BuildResult } from '../builder'

export interface Renderer {
    Exec(input: BuildResult[], output_dir: string): boolean
}