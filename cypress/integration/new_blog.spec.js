describe('New Blog Page', function() {
  const fields = [{
    id: '#project-title',
    text: 'Cypress test - title '+Math.random(),
  },{
    id: '#project-description',
    text: 'Cypress test - description '+Math.random()
  }, {
    id: '#project-repository',
    text: 'react'
  },{
    id: '#project-repository-excerpt-seo',
    text: 'Cypress test - title '+Math.random(),
  }]
  /*
    '#project-title',
    '#project-description',
    '#project-repository-id',
    '#project-blog-id',
    '#project-repository-repo-version',
    '#project-repository-repo-branch',
    '#project-repository-blog-url',
    '#project-repository-publish-date',
    '#project-repository-excerpt-seo'
  */

  it('it should open new blog page', function() {
    cy.visit('http://localhost:3000/new-blog')
  })

  it('should create new blog', function(){

    cy.visit('http://localhost:3000/new-blog');
    fields.forEach(field=>{
      if(field.id === '#project-description'){
        cy.window()
          .then(win => {
            win.tinymce.activeEditor.selection.setContent(field.text);
          })
      }else if(field.id === '#project-title'){
        cy.get(field.id).type(field.text);
      }else{
        cy.get("img[alt='open settings menu']").click();
        cy.get(field.id).type(field.text);
        if(field.id === '#project-repository'){
          cy.get(".project-repository-results-item").first().click();
        }
        cy.get('.custom-modal-backdrop').click();
      }
    })

    cy.get("img[alt='open settings menu']").click();
    cy.get("[data-testid='publish-blog']").click()
    cy.get('.custom-modal-backdrop').click();
    cy.contains("Blog saved successfully")

    cy.get(".navbar-brand").click();
    cy.contains(fields[0].text);
  })

  it("it should open the blog", ()=>{
    cy.contains('[data-testid="blog-title"]', fields[0].text).click();
    cy.url().should('include', '/blog');
  })
})
