const fs = require('fs');
const file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/backend/data/test_series/examgoal_pyqs_sets_relation.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const sol3 = `
<div style="margin-bottom: 20px;">
  <b>Let's solve this like a matching game! 🎮</b>
</div>

<div style="border: 2px dashed #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff3e0;">
  <b>🌟 Step 1: Divide into Teams (Groups)</b><br/>
  Set $$A = \\{0, 1, 2, \\dots, 9\\}$$. (Total 10 numbers)<br/>
  Rule: <b>$$|x - y|$$ must be a multiple of 3.</b><br/>
  This simply means $$x$$ and $$y$$ must give the <b>same remainder</b> when divided by 3!<br/><br/>
  Let's put them into 3 Teams based on remainders:<br/>
  <ul>
    <li><b>Team 0:</b> \\{0, 3, 6, 9\\} (4 players)</li>
    <li><b>Team 1:</b> \\{1, 4, 7\\} (3 players)</li>
    <li><b>Team 2:</b> \\{2, 5, 8\\} (3 players)</li>
  </ul>
  Friends can only be from the <b>same team</b>!
</div>

<div style="border: 2px solid #81c784; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f1f8e9;">
  <b>🤔 Step 2: Checking Statement I (Total pairs)</b><br/>
  How many pairs can we make?<br/>
  - Pairs in Team 0 = $$4 \\times 4 = 16$$ pairs.<br/>
  - Pairs in Team 1 = $$3 \\times 3 = 9$$ pairs.<br/>
  - Pairs in Team 2 = $$3 \\times 3 = 9$$ pairs.<br/>
  Total pairs = $$16 + 9 + 9 =$$ <b>34 pairs</b>.<br/>
  But Statement I says 36. So, <b>Statement I is FALSE! ❌</b>
</div>

<div style="border: 2px solid #64b5f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e3f2fd;">
  <b>🧐 Step 3: Checking Statement II (Equivalence)</b><br/>
  - <b>Reflexive:</b> Is $$|x - x|$$ a multiple of 3? Yes, 0 is a multiple of 3. (True)<br/>
  - <b>Symmetric:</b> If $$|x - y|$$ is a multiple of 3, is $$|y - x|$$? Yes, distance is same! (True)<br/>
  - <b>Transitive:</b> If X is in same team as Y, and Y is in same team as Z, are X and Z in same team? YES! (True)<br/><br/>
  Since all 3 pass, <b>Statement II is TRUE! ✅</b>
</div>

<div style="text-align: right; color: #d32f2f; font-weight: bold;">
  Final Answer: Statement I is false, Statement II is true.
</div>
`;

const sol4 = `
<div style="margin-bottom: 20px;">
  <b>Step-by-step decoding! 🚀</b>
</div>

<div style="border: 2px solid #ba68c8; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f3e5f5;">
  <b>🔢 Step 1: Find total elements in R ($$l$$)</b><br/>
  Rule: <b>$$2x + y \\le 2$$</b>. Set $$A = \\{-2, -1, 0, 1, 2, 3, 4\\}$$.<br/>
  Let's check for each $$x$$:<br/>
  - $$x = -2 \\implies -4 + y \\le 2 \\implies y \\le 6$$. All 7 elements work! (7 pairs)<br/>
  - $$x = -1 \\implies -2 + y \\le 2 \\implies y \\le 4$$. All 7 elements work! (7 pairs)<br/>
  - $$x = 0 \\implies 0 + y \\le 2 \\implies y \\le 2$$. Elements: -2, -1, 0, 1, 2. (5 pairs)<br/>
  - $$x = 1 \\implies 2 + y \\le 2 \\implies y \\le 0$$. Elements: -2, -1, 0. (3 pairs)<br/>
  - $$x = 2 \\implies 4 + y \\le 2 \\implies y \\le -2$$. Element: -2. (1 pair)<br/>
  - $$x = 3, 4$$ give no pairs.<br/>
  Total pairs <b>$$l = 7 + 7 + 5 + 3 + 1 = 23$$</b>.
</div>

<div style="border: 2px dashed #4db6ac; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e0f2f1;">
  <b>🪞 Step 2: Make it Reflexive ($$m$$)</b><br/>
  Reflexive means everyone needs a pair with themselves $$(x,x)$$.<br/>
  Rule for $$(x,x)$$: $$2x + x \\le 2 \\implies 3x \\le 2 \\implies x \\le 2/3$$.<br/>
  So $$-2, -1, 0$$ already have their self-pairs.<br/>
  Missing self-pairs for: $$1, 2, 3, 4$$.<br/>
  We need to add <b>$$m = 4$$</b> pairs!
</div>

<div style="border: 2px solid #e57373; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #ffebee;">
  <b>⚖️ Step 3: Make it Symmetric ($$n$$)</b><br/>
  Symmetric means if $$(x,y)$$ is in, $$(y,x)$$ must be in!<br/>
  Which existing pairs DO NOT have their reverse?<br/>
  It happens when $$2x+y \\le 2$$ but $$2y+x > 2$$. Let's hunt them down:<br/>
  - From $$x=-2$$: (-2,3) & (-2,4). Reverse not in!<br/>
  - From $$x=-1$$: (-1,2), (-1,3), & (-1,4). Reverse not in!<br/>
  - From $$x=0$$: (0,2). Reverse not in!<br/>
  Total lonely pairs = 6. So we must add their 6 reverse friends!<br/>
  <b>$$n = 6$$</b>.
</div>

<div style="border: 2px solid #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff8e1;">
  <b>🎯 Final Step: Add them up</b><br/>
  $$l + m + n = 23 + 4 + 6 =$$ <b>33</b>!
</div>
`;

const sol5 = `
<div style="margin-bottom: 20px;">
  <b>Super easy matching logic! 🧩</b>
</div>

<div style="border: 2px solid #81c784; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f1f8e9;">
  <b>🕵️ Step 1: Find the pairs</b><br/>
  Set $$M = \\{1, 2, \\dots, 16\\}$$.<br/>
  Rule: <b>$$4y = 5x - 3$$</b><br/>
  This means $$y = \\frac{5x - 3}{4}$$. Since $$y$$ must be an integer, $$(5x - 3)$$ must be in table of 4.<br/><br/>
  Let's test $$x$$ values:<br/>
  - $$x = 3 \\implies y = \\frac{15 - 3}{4} = 3$$. <b>Pair: (3, 3)</b><br/>
  - $$x = 7 \\implies y = \\frac{35 - 3}{4} = 8$$. <b>Pair: (7, 8)</b><br/>
  - $$x = 11 \\implies y = \\frac{55 - 3}{4} = 13$$. <b>Pair: (11, 13)</b><br/>
  - $$x = 15 \\implies y = \\frac{75 - 3}{4} = 18$$ (Rejected, 18 is bigger than 16)<br/>
  So, $$R = \\{(3,3), (7,8), (11,13)\\}$$.
</div>

<div style="border: 2px dashed #64b5f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e3f2fd;">
  <b>⚖️ Step 2: Make it Symmetric</b><br/>
  Symmetric means every $$(a,b)$$ must have a partner $$(b,a)$$.<br/>
  - (3,3) is its own partner! ✅<br/>
  - (7,8) is crying for <b>(8,7)</b>. 😭<br/>
  - (11,13) is crying for <b>(13,11)</b>. 😭<br/><br/>
  We just need to add these <b>2</b> missing partners!
</div>

<div style="text-align: right; color: #d32f2f; font-weight: bold;">
  Final Answer: 2 elements to be added.
</div>
`;

const sol6 = `
<div style="margin-bottom: 20px;">
  <b>Let's solve this visually! 👁️</b>
</div>

<div style="border: 2px solid #ba68c8; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f3e5f5;">
  <b>🔢 Step 1: Find total elements in R ($$l$$)</b><br/>
  Rule: <b>$$2x \\le 3y$$</b>. Set $$A = \\{2, 3, 5, 7, 9\\}$$.<br/>
  Total possible pairs = $$5 \\times 5 = 25$$.<br/>
  Instead of finding who passed, let's find the rule breakers (where $$2x > 3y$$):<br/>
  - If $$y = 2$$ (3y=6): We need $$2x > 6 \\implies x > 3$$. Fails for x=5,7,9. <b>(3 pairs)</b><br/>
  - If $$y = 3$$ (3y=9): We need $$2x > 9 \\implies x > 4.5$$. Fails for x=5,7,9. <b>(3 pairs)</b><br/>
  - If $$y = 5$$ (3y=15): We need $$2x > 15 \\implies x > 7.5$$. Fails for x=9. <b>(1 pair)</b><br/>
  - If $$y = 7$$ or $$9$$: No rule breakers.<br/>
  Total rule breakers = $$3 + 3 + 1 = 7$$ pairs.<br/>
  So, pairs IN relation <b>$$l = 25 - 7 = 18$$</b>.
</div>

<div style="border: 2px dashed #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff8e1;">
  <b>⚖️ Step 2: Make it Symmetric ($$m$$)</b><br/>
  To make it symmetric, if a pair is IN but its reverse is OUT, we must ADD the reverse!<br/>
  Well, we know exactly 7 pairs are OUT!<br/>
  Since $2x \\le 3y$ covers most things, the 7 rule breakers are exactly the reverses of 7 pairs that ARE in the relation!<br/>
  For example, (2,5) is IN, but (5,2) is OUT. So we MUST add (5,2).<br/>
  Since there are exactly 7 such pairs missing, we must add exactly those 7.<br/>
  So, <b>$$m = 7$$</b>.
</div>

<div style="border: 2px solid #81c784; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f1f8e9;">
  <b>🎯 Final Step: Add them up</b><br/>
  $$l + m = 18 + 7 =$$ <b>25</b>!
</div>
`;

const sol7 = `
<div style="margin-bottom: 20px;">
  <b>Let's solve this combination puzzle! 🧩</b>
</div>

<div style="border: 2px dashed #64b5f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e3f2fd;">
  <b>🪞 Step 1: Reflexive Requirement</b><br/>
  Set has 4 elements: $$A = \\{a, b, c, d\\}$$.<br/>
  For it to be reflexive, it <b>MUST</b> contain all self-pairs:<br/>
  $$(a,a), (b,b), (c,c), (d,d)$$<br/>
  These 4 pairs are fixed! No choices here.
</div>

<div style="border: 2px solid #e57373; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #ffebee;">
  <b>⚖️ Step 2: Symmetric Choices</b><br/>
  Symmetric means if you invite $$(a,b)$$, you MUST invite $$(b,a)$$. They come in combo-packs! 🎁<br/><br/>
  How many combo-packs (pairs of different elements) can we make from 4 elements?<br/>
  Using combinations: $$^{4}C_2 = \\frac{4 \\times 3}{2} = 6$$ combo-packs.<br/>
  They are: <b>{a,b}, {a,c}, {a,d}, {b,c}, {b,d}, {c,d}</b>.<br/><br/>
  For each combo-pack, we have <b>2 choices</b>:
  1. Keep them BOTH IN the relation.
  2. Keep them BOTH OUT of the relation.<br/><br/>
  So, total possible relations = $$2 \\times 2 \\times 2 \\times 2 \\times 2 \\times 2 = 2^6$$.
</div>

<div style="border: 2px solid #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff8e1;">
  <b>🎯 Final Answer</b><br/>
  $$2^6 =$$ <b>64</b> possible relations!
</div>
`;

data.questions['types_of_relations'][2].solution = sol3;
data.questions['types_of_relations'][3].solution = sol4;
data.questions['types_of_relations'][4].solution = sol5;
data.questions['types_of_relations'][5].solution = sol6;
data.questions['types_of_relations'][6].solution = sol7;

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated solutions for Q3 to Q7.');
