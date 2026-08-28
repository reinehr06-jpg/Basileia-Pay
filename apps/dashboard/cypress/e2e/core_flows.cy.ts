describe('Basileia Pay Core Flows', () => {
  beforeEach(() => {
    // Reset session and login before each test
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@basileia.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('should allow navigation to developers sandbox and simulate checkout', () => {
    cy.visit('/dashboard/developers')
    cy.get('input[placeholder="Valor Cobrado (R$)"]').type('100.50')
    cy.get('button:contains("Pix")').click()
    cy.get('button:contains("Executar Simulação")').click()
    
    // Check if the simulation was added to the table
    cy.contains('100.50')
    cy.contains('Pix')
  })

  it('should view the trust score of a transaction', () => {
    cy.visit('/dashboard/trust')
    cy.get('button').contains('Análise de Score').click()
    cy.get('input[placeholder*="Buscar pagamento por ID"]').type('pay_8f3a2d7e9b1c')
    cy.get('button:contains("Analisar")').click()
    
    // Check score detail rendering
    cy.contains('score: 85')
  })
})
