// const statusEnum = require('../../../../app/constants/status-enum')

// const getTaskCountsByStatus = require('../../../../app/services/data/get-task-counts-by-status')

// describe('services/data/get-task-counts-by-status', () => {
//   it('should return task counts', done => {
//     getTaskCountsByStatus().then(function (statusCounts) {
//       expect(statusCounts[0]).to.contain(`IntSchema-${statusEnum.PENDING}`)
//       expect(statusCounts[1]).to.contain(`IntSchema-${statusEnum.INPROGRESS}`)
//       expect(statusCounts[2]).to.contain(`IntSchema-${statusEnum.COMPLETE}`)
//       expect(statusCounts[3]).to.contain(`IntSchema-${statusEnum.FAILED}`)
//       expect(statusCounts[4]).to.contain(`ExtSchema-${statusEnum.PENDING}`)
//       expect(statusCounts[5]).to.contain(`ExtSchema-${statusEnum.INPROGRESS}`)
//       expect(statusCounts[6]).to.contain(`ExtSchema-${statusEnum.COMPLETE}`)
//       expect(statusCounts[7]).to.contain(`ExtSchema-${statusEnum.FAILED}`)
//       done()
//     })
//   })
// })
