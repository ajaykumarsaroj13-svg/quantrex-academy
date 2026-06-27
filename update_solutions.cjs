const fs = require('fs');
const file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/frontend/backend/data/test_series/examgoal_pyqs_sets_relation.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const sol1 = `
<div style="margin-bottom: 20px;">
  <b>Hello student! Let's solve this step-by-step like a puzzle! 🧩</b>
</div>

<div style="border: 2px solid #81c784; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f1f8e9;">
  <b>🌟 Step 1: Understand the Rule</b><br/>
  Set $$A = \\{-2, -1, 0, 1, 2\\}$$<br/>
  Friendship Rule for $$R$$: Two numbers $$a$$ and $$b$$ become friends if <b>$$1 + ab > 0$$</b>. This simply means <b>$$ab > -1$$</b>.
</div>

<div style="border: 2px solid #64b5f6; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e3f2fd;">
  <b>🧐 Step 2: Checking Statement I (Total pairs in R)</b><br/>
  Total possible pairs from set A $$\\times$$ A = $$5 \\times 5 = 25$$ pairs.<br/>
  Instead of finding who passed, let's find the rule breakers (where $$ab \\le -1$$):<br/>
  <ul style="margin-top: 5px;">
    <li>If $$a = -2$$: We need $$b$$ such that $$-2b \\le -1$$. That happens if $$b = 1$$ (product -2) or $$b = 2$$ (product -4). So, <b>(-2, 1)</b> and <b>(-2, 2)</b> fail.</li>
    <li>If $$a = -1$$: We need $$b$$ such that $$-1b \\le -1$$. That happens if $$b = 1$$ (product -1) or $$b = 2$$ (product -2). So, <b>(-1, 1)</b> and <b>(-1, 2)</b> fail.</li>
    <li>If $$a = 1$$: Fails with <b>(1, -1)</b> and <b>(1, -2)</b>.</li>
    <li>If $$a = 2$$: Fails with <b>(2, -1)</b> and <b>(2, -2)</b>.</li>
  </ul>
  Total rule breakers = 8 pairs.<br/>
  So, friends in R = $$25 - 8 = 17$$ pairs. <b>Statement I is TRUE! ✅</b>
</div>

<div style="border: 2px solid #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff8e1;">
  <b>🤔 Step 3: Checking Statement II (Equivalence Relation)</b><br/>
  Equivalence means it must be Reflexive, Symmetric, and Transitive.<br/><br/>
  Let's check <b>Transitive</b> (Friend of friend should be my friend).<br/>
  Let $$a = -2$$, $$b = 0$$, $$c = 1$$.<br/>
  - Is $$(-2, 0)$$ in R? $$1 + (-2)(0) = 1 > 0$$. Yes! (-2 is friend with 0)<br/>
  - Is $$(0, 1)$$ in R? $$1 + (0)(1) = 1 > 0$$. Yes! (0 is friend with 1)<br/>
  - But is $$(-2, 1)$$ in R? $$1 + (-2)(1) = -1$$, which is NOT $$> 0$$. So, NO! (-2 is NOT friend with 1) 💔<br/><br/>
  Since friendship broke, it is <b>NOT Transitive</b>. So, <b>Statement II is FALSE! ❌</b>
</div>

<div style="text-align: right; color: #d32f2f; font-weight: bold;">
  Final Answer: Statement I is true, Statement II is false.
</div>
`;

const sol2 = `
<div style="margin-bottom: 20px;">
  <b>Let's decode this problem easily! 🕵️‍♂️</b>
</div>

<div style="border: 2px dashed #9575cd; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #ede7f6;">
  <b>🔍 Step 1: Decode the Math Language</b><br/>
  Condition: $$\\log_{e}(x+y) \\le 2$$<br/>
  This means $$x + y \\le e^2$$.<br/>
  Since $$e \\approx 2.718$$, we know $$e^2 \\approx 7.389$$.<br/>
  Since $$x$$ and $$y$$ are Natural Numbers (1, 2, 3...), their sum must be an integer.<br/>
  So the rule is simply: <b>$$x + y \\le 7$$</b>.
</div>

<div style="border: 2px solid #4db6ac; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #e0f2f1;">
  <b>📝 Step 2: How many pairs currently exist?</b><br/>
  Let's list them out!<br/>
  $$x=1 \\rightarrow y$$ can be $$1,2,3,4,5,6$$ (6 pairs)<br/>
  $$x=2 \\rightarrow y$$ can be $$1,2,3,4,5$$ (5 pairs)<br/>
  $$x=3 \\rightarrow y$$ can be $$1,2,3,4$$ (4 pairs)<br/>
  ... down to $$x=6 \\rightarrow y=1$$ (1 pair).<br/>
  Total existing pairs = $$6+5+4+3+2+1 = $$ <b>21 pairs</b>.
</div>

<div style="border: 2px solid #e57373; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #ffebee;">
  <b>🔗 Step 3: Making it Transitive (The Missing Link!)</b><br/>
  Transitive property means: If $$(a,b)$$ and $$(b,c)$$ exist, $$(a,c)$$ MUST exist.<br/><br/>
  Notice that <b>(6, 1)</b> is in our set ($$6+1 \\le 7$$).<br/>
  And <b>(1, 6)</b> is also in our set ($$1+6 \\le 7$$).<br/>
  By transitivity, the pair <b>(6, 6)</b> MUST be added! (Even though $$6+6=12 > 7$$).<br/><br/>
  In fact, 1 acts as a common bridge for everyone. Any number from 1 to 6 can connect to 1, and 1 can connect to any number from 1 to 6.<br/>
  So, to make it transitive, we must add ALL possible pairs using numbers from $$\\{1,2,3,4,5,6\\}$$.<br/>
  Total pairs required = $$6 \\times 6 = $$ <b>36 pairs</b>.
</div>

<div style="border: 2px solid #ffb74d; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #fff8e1;">
  <b>🎯 Final Step: The Answer</b><br/>
  We need 36 pairs to make it transitive.<br/>
  We already have 21 pairs.<br/>
  Pairs to be added = $$36 - 21 =$$ <b>15</b>! 🎉
</div>
`;

data.questions['types_of_relations'][0].solution = sol1;
data.questions['types_of_relations'][1].solution = sol2;

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated solutions for Q1 and Q2.');
