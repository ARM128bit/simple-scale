import db from '../database.mjs'

export function handleSetMethods(event, payload) {
  try {
    db.exec('DELETE FROM methods;')
    const insertStatement = db.prepare(
      'INSERT INTO methods (code, name, significant_digit, calc_type, const_weight_rule, enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const insertRuleStatement = db.prepare(
      'INSERT INTO methods_repeatability_rules (code, start, end, type, value) VALUES (?, ?, ?, ?, ?)',
    )
    for (const method of payload) {
      insertStatement.run(
        method.code,
        method.name,
        method.significant_digit,
        method.calc_type,
        method.const_weight_rule ?? null,
        +method.enabled,
        new Date().toISOString(),
      )

      const deleteRulesStatement = db.prepare(
        'DELETE FROM methods_repeatability_rules WHERE code = ?',
      )
      deleteRulesStatement.run(method.code)
      for (const rule of method.repeatability_rules ?? []) {
        insertRuleStatement.run(method.code, rule.start, rule.end, rule.type, rule.value)
      }
    }
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}

export function handleGetMethods() {
  const methodsStatement = db.prepare(`SELECT json_object(
         'code', method.code, 'name', method.name, 'significant_digit', method.significant_digit,
         'calc_type', method.calc_type, 'const_weight_rule', method.const_weight_rule,
         'enabled', method.enabled, 'created_at', method.created_at,
         'repeatability_rules', json_group_array(
            json_object('id', rule.id, 'start', rule.start, 'end', rule.end, 'type', rule.type, 'value', rule.value)
          )
       ) result
  FROM methods as method LEFT OUTER JOIN methods_repeatability_rules as rule
  ON method.code = rule.code
  GROUP BY method.code`)
  return methodsStatement.all().map((item) => JSON.parse(item.result))
}
