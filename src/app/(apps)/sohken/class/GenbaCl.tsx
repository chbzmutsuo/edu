import {Genba} from '@prisma/client'

export class GenbaCl {
  genba: Genba
  floorThisPlay: string
  constructor(genba) {
    this.genba = genba

    const {
      houseHoldsCount1,
      houseHoldsCount2,
      houseHoldsCount3,
      houseHoldsCount4,
      houseHoldsCount5,
      houseHoldsCount6,
      houseHoldsCount7,
    } = this.genba
    const floors = [
      houseHoldsCount1,
      houseHoldsCount2,
      houseHoldsCount3,
      houseHoldsCount4,
      houseHoldsCount5,
      houseHoldsCount6,
      houseHoldsCount7,
    ].filter(Boolean)

    this.floorThisPlay = floors.join(`.`)
  }
}
