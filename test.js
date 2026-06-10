const s = '$$mn$$';
console.log('Original:', s);
console.log('Replace string:', s.replace(/\$\$/g, '$'));
console.log('Replace function:', s.replace(/\$\$/g, () => '$'));