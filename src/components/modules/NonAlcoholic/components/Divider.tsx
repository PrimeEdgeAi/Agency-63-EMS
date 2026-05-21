import { tokens } from '../tokens'

interface DividerProps {
  spacing?: number
}

export function Divider({ spacing = 0 }: DividerProps) {
  return (
    <div
      style={{
        height: '1px',
        background: tokens.borderSubtle,
        margin: spacing ? `${spacing}px 0` : 0,
      }}
    />
  )
}
