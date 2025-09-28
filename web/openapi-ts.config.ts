export default {
  input: './openapi.json',
  output: 'src/api/generated',
  plugins: [
    '@hey-api/typescript', // 只生成类型
  ],
  types: {
    enums: 'javascript', // 用对象而不是 enum
  },
}
