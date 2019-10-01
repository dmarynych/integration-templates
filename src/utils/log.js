const show = (integrationList) => {
  console.log('Existing integrations:');
  console.log('-------------------');
  for (let i in integrationList) {
    console.log(i)
    console.log(' versions:');
    for (let iv in integrationList[i].versions) {
      console.log(' - ', iv);
    }
    console.log('-------------------');
  }
}

module.exports = {
  show,
}
