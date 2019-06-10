var server = require('./server');
var ds = server.dataSources.opensourcerepos;
var lbTables = ['tags','blog','app-users','repo'];
// ds.automigrate(lbTables, function(er) {
//   if (er) throw er;
//   console.log('Loopback tables [' - lbTables - '] created in ', ds.adapter.name);
//   ds.disconnect();
// });
ds.autoupdate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' - lbTables - '] updated in', ds.adapter.name);
  ds.disconnect();
})
// ds.isActual(lbTables, function(err, actual) {
//   console.log('actual', actual)
//   if (!actual) {
//     ds.autoupdate(lbTables, function(er) {
//       if (er) throw er;
//       console.log('Loopback tables [' - lbTables - '] updated in', ds.adapter.name);
//       ds.disconnect();
//     })
//   }
// })
