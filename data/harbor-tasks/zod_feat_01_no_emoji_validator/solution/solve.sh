#!/usr/bin/env bash
# Oracle reference solution: Add noEmoji() to ZodString
set -e

node << 'JSEOF'
const fs = require('fs');
const path = '/app/src/types.ts';
let src = fs.readFileSync(path, 'utf8');

if (src.includes('no_emoji')) {
  console.log('noEmoji already implemented.');
  process.exit(0);
}

// 1. Add check kind type
src = src.replace(
  /(\| \{ kind: "emoji" \})/,
  '$1\n  | { kind: "no_emoji"; message?: string }'
);

// 2. Add noEmoji() method after emoji() method
const emojiMethodEnd = src.indexOf('emoji(message');
const insertAfter = src.indexOf('\n  }', emojiMethodEnd) + 4;
const noEmojiMethod = `

  noEmoji(message?: string | { message?: string }) {
    return this._addCheck({
      kind: "no_emoji",
      ...errorUtil.errToObj(message),
    });
  }`;
src = src.slice(0, insertAfter) + noEmojiMethod + src.slice(insertAfter);

// 3. Handle the check in _parse
const noEmojiCheck = `
        if (check.kind === "no_emoji") {
          if (/\\p{Extended_Pictographic}/u.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "no_emoji",
              code: ZodIssueCode.invalid_string,
              message: check.message,
            });
            status.dirty();
          }
        } else `;

// Insert before the last else block closing emoji check
src = src.replace(
  /(if \(check\.kind === "emoji"\) \{[\s\S]*?\} else )(if \(check\.kind === "endsWith"\))/,
  `$1${noEmojiCheck}$2`
);

fs.writeFileSync(path, src);
console.log('noEmoji() added to ZodString.');
JSEOF

echo "Reference solution applied."
