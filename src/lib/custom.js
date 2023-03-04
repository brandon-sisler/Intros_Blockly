import Blockly from 'blockly'

let Proposition = ["Variable", "Formula"];
let formulas = ["combination", "quantifier", "negation"]
let blockJsonArray = [];
const nlGenerator = new Blockly.Generator('natural_language');
const coqGenerator = new Blockly.Generator('coq');

const snake_case = (str = '') => {
  const strArr = str.split(' ');
  const snakeArr = strArr.reduce((acc, val) => {
     return acc.concat(val.toLowerCase());
  }, []);
  return snakeArr.join('_');
};



blockJsonArray.push(
  {
    "type": "variable",
    "message0": "%1",
    "args0": [
      {
        "type": "field_input",
        "name": "NAME",
        "text": "P"
      },
    ],
    "output": "Variable",
    "colour": 270,
  }
);

nlGenerator['variable'] = function (block) {
  return [block.getFieldValue('NAME'), 0];
}

coqGenerator['variable'] = function (block) {
  return [block.getFieldValue('NAME'), 0];
}



blockJsonArray.push(
  {
    "type": "quantifier",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "TYPE",
        "options": [
          [
            "∀",
            "forall"
          ],
          [
            "∃",
            "exists"
          ]
        ]
      },
      {
        "type": "input_value",
        "name": "VARIABLE",
        "check": "Variable"
      },
      {
        "type": "input_value",
        "name": "PREDICATE",
        "check": Proposition
      }
    ],
    "inputsInline": false,
    "output": "Formula",
    "colour": 180,
    // "extensions": ["quantifierMixin"],
  }
);


nlGenerator['quantifier'] = function (block) {
  var type = block.getFieldValue('TYPE');
  if (type === "forall") {
    var result = "for all propositions "
  } else {
    var result = "there exists a proposition "
  }
  result = result + '<m>' + nlGenerator.valueToCode(block, 'VARIABLE', 0) + '</m>';
  if (type === "forall") {
    result = result + ', '
  } else {
    result = result + ' such that '
  }
  result = result + nlGenerator.valueToCode(block, 'PREDICATE', 0);
  return [result, 0]
}

coqGenerator['quantifier'] = function (block) {
  var pred = coqGenerator.valueToCode(block, 'PREDICATE', 0);
  let result = block.getFieldValue('TYPE') + ' ' + coqGenerator.valueToCode(block, 'VARIABLE', 0) + ' : Prop, ' + pred
  return [result, 0]
}



blockJsonArray.push(
  {
    "type": "combination",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "PROPOSITION1",
        "check": Proposition,
      },
      {
        "type": "field_dropdown",
        "name": "TYPE",
        "options": [
          [
            "∧",
            "and"
          ],
          [
            "∨",
            "or"
          ],
          [
            "→",
            "implies"
          ],
          [
            "↔",
            "iff"
          ],
        ]
      },
      {
        "type": "input_value",
        "name": "PROPOSITION2",
        "check": Proposition,
      },
    ],
    "inputsInline": true,
    "output": "Formula",
    "colour": 65,
    // "extensions": ["combinationMixin"]
  }
);

nlGenerator['combination'] = function (block) {
  let result = nlGenerator.valueToCode(block, 'PROPOSITION1', 0);
  let type = block.getFieldValue('TYPE');
  if (type=="and") {
    result = result + " \\wedge ";
  } else if (type=="implies") {
    result = result + " \\rightarrow ";
  } else if (type=="iff") {
    result = result + " \\leftrightarrow ";
  } else {
    result = result + " \\vee ";
  }
  result = result + nlGenerator.valueToCode(block, 'PROPOSITION2', 0);
  return [result, 0]
}

coqGenerator['combination'] = function (block) {
  var type = block.getFieldValue('TYPE');
  if (type == 'and') {
    var connection = '/\\';
  } else if (type == 'or') {
    var connection = '\\/';
  } else if (type == 'implies') {
    var connection = '->';
  } else if (type == 'iff') {
    var connection = '<->';
  }
  var result = coqGenerator.valueToCode(block, 'PROPOSITION1', 0) + ' ' + connection + ' ' + coqGenerator.valueToCode(block, 'PROPOSITION2', 0);
  return [result, 0]
}



blockJsonArray.push(
  {
    "type": "negation",
    "message0": "¬ %1",
    "args0": [
      {
        "type": "input_value",
        "name": "PROPOSITION",
        "check": Proposition,
      },
    ],
    "inputsInline": true,
    "output": "Formula",
    "colour": 0,
    "helpUrl": ""
  }
);

nlGenerator['negation'] = function (block) {
  if (!block.getInputTargetBlock("PROPOSITION")) {
    var result = "<m>\\neg</m>";
  } else if (formulas.includes(block.getInputTargetBlock("PROPOSITION").type)) {
    var result = "not "+nlGenerator.valueToCode(block, 'PROPOSITION', 0);
  } else {
    var result = '<m>\\neg ' + nlGenerator.valueToCode(block, 'PROPOSITION', 0) + '</m>';
  }
  return [result, 0]
}

coqGenerator['negation'] = function (block) {
  var result = "~ " + coqGenerator.valueToCode(block, 'PROPOSITION', 0);
  return [result, 0]
}

// // TODO
// Blockly.Extensions.registerMixin('quantifierMixin', {
//   nlIntro: function(p) {
//       return "<p>Let <m>" + p + "</m> be a proposition.</p>"
//   }
// });
// Blockly.Extensions.registerMixin('combinationMixin', {
//   nlIntro: function(h) {
//       return "<p>Let <m>" + h + "</m> be the assumpton that " + nlGenerator.valueToCode(this, 'PROPOSITION1' ,0) + ".</p>"
//   }
// });


blockJsonArray.push(
  {
    "type": "theorem",
    "message0": "Theorem %1 %2",
    "args0": [
      {
        "type": "field_input",
        "name": "NAME",
        "text": "My Theorem",
      },
      {
        "type": "input_value",
        "name": "PROPOSITION",
        "check": Proposition,
      }
    ],
    "message1": "Proof %1",
    "args1": [
      {
        "type": "input_statement",
        "name": "ARGUMENT"
      }
    ],
    "message2": "Q.E.D. %1",
    "args2": [
      {
        "type": "input_dummy",
        "align": "RIGHT",
      }
    ],
    "colour": 230,
  }
);

nlGenerator['theorem'] = function (block) {
  let prop = nlGenerator.valueToCode(block, 'PROPOSITION', 0);
  prop = prop.trim();
  let result = '<knowl mode="theorem">\n';
  result = result + '  <title>' + block.getFieldValue('NAME') + '</title>\n'
  result = result + '  <content>\n';
  result = result + '    <p>' + prop.charAt(0).toUpperCase() + prop.slice(1) + '.</p>\n';
  result = result + '  </content>\n';
  result = result + '  <outtro>\n';
  result = result + nlGenerator.statementToCode(block, 'ARGUMENT') + "\n";
  result = result + '  </outtro>\n';
  result = result + '</knowl>';
  return result
}

coqGenerator['theorem'] = function (block) {
  return "Theorem " + snake_case(block.getFieldValue('NAME')) + " : " +
    coqGenerator.valueToCode(block, 'PROPOSITION', 0).trim() + ".\n" +
    "Proof.\n" +
    coqGenerator.statementToCode(block, 'ARGUMENT')
}



blockJsonArray.push(
  {
    "type": "intro",
    "message0": "Let %1 be the %2 %3",
    "args0": [
      {
        "type": "field_input",
        "name": "NAME",
        "text": "P"
      },
      {
        "type": "field_dropdown",
        "name": "TYPE",
        "options": [
          [
            "proposition",
            "forall"
          ],
          [
            "assumption that",
            "implies"
          ]
        ]
      },
      {
        "type": "input_value",
        "name": "PROPOSITION",
        "check": Proposition,
      }
    ],
    "colour": 120,
    "previousStatement": null,
    "nextStatement": null,
  }
);

nlGenerator['intro'] = function (block) {
  // var parent = block.getSurroundParent()
  // if (parent) {
  //   var prop = parent.getInputTargetBlock("PROPOSITION")
  //   if (prop) {
  //     return prop.nlIntro(block.getFieldValue("NAME"))
  //   }
  // }
  return "<p>Let <m>" + block.getFieldValue("NAME") + "</m> be a proposition.</p>"
}

coqGenerator['intro'] = function (block) {
  return 'intro ' + block.getFieldValue('NAME') +".";
}



blockJsonArray.push(
  {
    "type": "destruct",
    "message0": "From %1 %2 we have both %3 %4 and %5 %6",
    "args0": [
      {
        "type": "field_input",
        "name": "ASSUMPTION",
        "text": "H"
      },
      {
        "type": "input_value",
        "name": "ASSUMPTIONPROP",
        // "check": "combination",
      },
      {
        "type": "field_input",
        "name": "HYPOTHESIS1",
        "text": "HP"
      },
      {
        "type": "input_value",
        "name": "PROPOSITION1",
        "check": Proposition,
      },
      {
        "type": "field_input",
        "name": "HYPOTHESIS2",
        "text": "HQ"
      },
      {
        "type": "input_value",
        "name": "PROPOSITION2",
        "check": Proposition,
      }
    ],
    "inputsInline": true,
    "colour": 70,
    "previousStatement": null,
    "nextStatement": null,
  }
);

nlGenerator['destruct'] = function (block) {
  let result = `<p>From <m>${nlGenerator.valueToCode(block, 'ASSUMPTIONPROP', 0)}</m> `;
  result = result + `we have both <m>${nlGenerator.valueToCode(block, 'PROPOSITION1', 0)}</m> and <m>${nlGenerator.valueToCode(block, 'PROPOSITION2', 0)}</m>.</p>`
  return result
}

coqGenerator['destruct'] = function (block) {
  return `destruct ${block.getFieldValue('ASSUMPTION')} (${block.getFieldValue('HYPOTHESIS1')},${block.getFieldValue('HYPOTHESIS2')}).`;
}



blockJsonArray.push(
  {
    "type": "conj",
    "message0": "From both %1 and %2 we have %3",
    "args0": [
      {
        "type": "field_input",
        "name": "HYPOTHESIS1",
        "text": "HP"
      },
      {
        "type": "field_input",
        "name": "HYPOTHESIS2",
        "text": "HQ"
      },
      {
        "type": "input_value",
        "name": "CONJUNCTION",
      },
    ],
    "colour": 30,
    "previousStatement": null,
    "nextStatement": null,
  }
);


nlGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + '\n' + nlGenerator.blockToCode(nextBlock);
  }
  return code;
};
coqGenerator.scrub_  = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + '\n' + coqGenerator.blockToCode(nextBlock);
  }
  return code;
};
nlGenerator.INDENT = " ".repeat(4)
coqGenerator.INDENT = " ".repeat(0)

Blockly.common.defineBlocksWithJsonArray(blockJsonArray);



export function createWorkspace(div,opts) {
  var workspace = Blockly.inject(div,opts);
  var startBlock = workspace.newBlock("theorem");
  startBlock.setDeletable(false);
  startBlock.setMovable(false);
  startBlock.initSvg();
  workspace.render();
  workspace.addChangeListener(Blockly.Events.disableOrphans);
  return workspace
}

export function nlOutput(workspace) {
  return nlGenerator.workspaceToCode(workspace);
}

export function coqOutput(workspace) {
  return coqGenerator.workspaceToCode(workspace);
}