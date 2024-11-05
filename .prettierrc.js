module.exports = {
  semi: false, // 不使用分号
  singleQuote: true, // 使用单引号
  trailingComma: 'es5', // 尾随逗号
  printWidth: 100, // 每行最大长度
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而不是 tab
  bracketSpacing: true, // 对象字面量中的括号空格
  arrowParens: 'avoid', // 箭头函数单参数时不使用括号
  endOfLine: 'lf', // 换行符使用 lf
  plugins: ['prettier-plugin-tailwindcss'], // 添加 Tailwind 插件
} 