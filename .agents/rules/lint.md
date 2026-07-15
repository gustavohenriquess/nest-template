# Linting & Code Style
This project uses ESLint with Flat Config (`eslint.config.mjs`) and Prettier for formatting.
Always respect the following lint rules when writing or modifying code:

1. **Unused Variables**: `no-unused-vars` is set to error. However, unused arguments are allowed if they are prefixed with an underscore (e.g., `_req`, `_res`). Always prefix intentionally unused parameters with `_`.
2. **Explicit Any**: `no-explicit-any` is disabled (`off`), meaning the use of `any` is allowed, though you should still prefer proper typing when possible.
3. **Promises**: `no-floating-promises` is set to `warn`. Always ensure promises are properly handled (`await`ed, returned, or `.catch()`ed) to avoid floating promises.
4. **Unsafe Arguments**: `no-unsafe-argument` is set to `warn`. Try to avoid passing `any` typed values into functions expecting specific types.
5. **Formatting**: Prettier is configured as an ESLint rule (`prettier/prettier`). The `endOfLine` is set to `auto`. Do not introduce manual formatting fixes that conflict with Prettier's defaults.
