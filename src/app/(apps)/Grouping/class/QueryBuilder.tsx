import {getIncludeType, includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const student = {
      include: {
        UnfitFellow: {include: {Student: {include: {Classroom: {}}}}},
        Classroom: {},
      },
    }

    const teacher = {
      include: {
        School: {},
        TeacherClass: {include: {Classroom: {}}},
      },
    }

    const classroom = {
      include: {
        School: {},
        Student: student,
        TeacherClass: {include: {Teacher: {}}},
      },
    }

    const school = {
      include: {Teacher: teacher, Student: {}, Classroom: {}},
    }

    const squad = {
      include: {
        StudentRole: {
          include: {
            Student: {},
            LearningRoleMasterOnGame: {},
          },
        },
        Student: {
          include: {
            // Answer: {},
            Classroom: {},
          },
        },
      },
    }

    const game = {
      include: {
        GroupCreateConfig: {},
        GameStudent: {
          include: {
            Student: {
              include: {
                Classroom: {},
              },
            },
          },
        },
        SubjectNameMaster: {},
        QuestionPrompt: {
          orderBy: {id: 'asc'},
          include: {Game: {include: {}}, Group: {}},
        },
        LearningRoleMasterOnGame: {},

        Teacher: {},
        Group: {
          include: {
            Game: {},
            Squad: squad,
          },
        },
        Answer: {orderBy: {id: 'asc'}},
      },
    }

    const group = {
      include: {
        Game: game,
        Squad: squad,
      },
    }

    const include: getIncludeType = {
      // room,

      questionPrompt: {
        orderBy: {id: 'asc'},
        include: {Game: {include: {}}, Group: {}},
      },
      classroom,
      student,
      school,
      game: game as any,
      group: group as any,
      teacher,
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
