describe('Index page', function() {
  it('it should load blogs!', function() {
    cy.visit('http://localhost:3000')
  })

  it('should search for blogs', function(){
    cy.visit('http://localhost:3000');
    cy.get('#searchNavBar')  // 4.
      .type('react')
    cy.contains('Search') // 2.
      .click()
    cy.url()                   // 8.
      .should('include', '/?repo=react')
    cy.get('[data-testid=repo_name]').should('contain', 'facebook/react');
  })

})
