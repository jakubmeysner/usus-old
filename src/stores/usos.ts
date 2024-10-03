import { defineStore } from "pinia"

export interface Term {
    id: string

    name: {
        pl: string
        en: string
    }

    start_date: string
    end_date: string
    order_key: number
    finish_date: string
    is_active: boolean
}

export interface Course {
    id: string

    name: {
        pl: string
        en: string
    }

    homepage_url: string
    profile_url: string
    is_currently_conducted: boolean
    fac_id: string
    lang_id: string

    terms: {
        id: string
    }[]

    ects_credits_simplified: number
}

export interface CourseEdition {
    course_id: string

    course_name: {
        pl: string
        en: string
    }

    term_id: string
    homepage_url: string
    profile_url: string

    lecturers: {
        id: string
        first_name: string
        last_name: string
        user_id: string
    }[]

    course_units_ids: string[]
}

export interface CourseUnit {
    id: string
    homepage_url: string | null
    profile_url: string

    class_groups: {
        course_unit_id: string
        number: number
    }[]
}

export interface BaseActivity {
    type: "classgroup" | "classgroup2" | "meeting" | "exam"
    start_time: string
    end_time: string

    name: {
        pl: string
        en: string
    }

    url: string | null
}

export interface BaseClassGroupActivity extends BaseActivity {
    type: "classgroup" | "classgroup2"
    course_id: string

    course_name: {
        pl: string
        en: string
    }

    classtype_name: {
        pl: string
        en: string
    }

    lecturer_ids: number[]
    group_number: number
    classgroup_profile_url: string

    building_name: {
        pl: string
        en: string
    }

    building_id: string | null
    room_number: string
    room_id: number | null
    unit_id: number
    classtype_id: string
    cgwm_id: number
}

export interface ClassGroupActivity extends BaseClassGroupActivity {
    type: "classgroup"
    frequency: string
}

export interface ClassGroup2Activity extends BaseClassGroupActivity {
    type: "classgroup2"
    sm_id: number
}

export interface MeetingActivity extends BaseActivity {
    type: "meeting"
}

export interface ExamActivity extends BaseActivity {
    type: "exam"
}

export type Activity =
    | ClassGroupActivity
    | ClassGroup2Activity
    | MeetingActivity
    | ExamActivity

export interface ParticipantCount {
    count: number
    limit: number
}

export const useUsosStore = defineStore("usos", {
    state: () => ({
        terms: null as Term[] | null,
        courses: {} as Record<string, Course>,
        courseEditions: {} as Record<
            string,
            Record<string, CourseEdition | null>
        >,
        courseUnits: {} as Record<string, CourseUnit>,
        classGroupDates: {} as Record<string, Record<number, Activity[]>>,
        classGroupParticipantCount: {} as Record<
            string,
            Record<number, ParticipantCount>
        >,
    }),
    actions: {
        async loadTerms(): Promise<void> {
            const response = await fetch(
                "https://apps.usos.pwr.edu.pl/services/terms/terms_index?term_type=semester&active_only=true",
            )

            if (response.status === 200) {
                this.terms = (await response.json()) as Term[]
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
        async loadCourse(id: string): Promise<void> {
            const response = await fetch(
                `https://apps.usos.pwr.edu.pl/services/courses/course?course_id=${id}&fields=id|name|homepage_url|profile_url|is_currently_conducted|terms|fac_id|lang_id|ects_credits_simplified`,
            )

            if (response.status === 200) {
                this.courses[id] = (await response.json()) as Course
            } else if (response.status === 400) {
                throw new Error("Course with given ID does not exist")
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
        async loadCourseEdition(
            courseId: string,
            termId: string,
        ): Promise<void> {
            if (!(courseId in this.courseEditions)) {
                this.courseEditions[courseId] = {}
            }

            const response = await fetch(
                `https://apps.usos.pwr.edu.pl/services/courses/course_edition?course_id=${courseId}&term_id=${termId}&fields=course_id|course_name|term_id|homepage_url|profile_url|coordinators|lecturers|course_units_ids`,
            )

            if (response.status === 200) {
                this.courseEditions[courseId][termId] =
                    (await response.json()) as CourseEdition
            } else if (response.status === 400) {
                this.courseEditions[courseId][termId] = null
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
        async loadCourseUnit(id: string): Promise<void> {
            const response = await fetch(
                `https://apps.usos.pwr.edu.pl/services/courses/course_unit?course_unit_id=${id}&fields=id|homepage_url|profile_url|class_groups`,
            )

            if (response.status === 200) {
                this.courseUnits[id] = (await response.json()) as CourseUnit
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
        async loadClassGroupDates(
            unitId: string,
            groupNumber: number,
        ): Promise<void> {
            if (!(unitId in this.classGroupDates)) {
                this.classGroupDates[unitId] = {}
            }

            const response = await fetch(
                `https://apps.usos.pwr.edu.pl/services/tt/classgroup_dates2?unit_id=${unitId}&group_number=${groupNumber}&fields=type|start_time|end_time|name|url|course_id|course_name|classtype_name|lecturer_ids|group_number|classgroup_profile_url|building_name|building_id|room_number|room_id|unit_id|classtype_id|cgwm_id|frequency|sm_id`,
            )

            if (response.status === 200) {
                this.classGroupDates[unitId][groupNumber] =
                    (await response.json()) as Activity[]
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
        async loadClassGroupParticipantCount(
            unitId: string,
            groupNumber: number,
        ): Promise<void> {
            if (!(unitId in this.classGroupParticipantCount)) {
                this.classGroupParticipantCount[unitId] = {}
            }

            const response = await fetch(
                `${
                    import.meta.env.VITE_FUNCTIONS_BASE_URL
                }/participant-count?unitId=${unitId}&groupNumber=${groupNumber}`,
            )

            if (response.status === 200) {
                this.classGroupParticipantCount[unitId][groupNumber] =
                    (await response.json()) as ParticipantCount
            } else {
                throw new Error(
                    `An unexpected error has occurred, status ${response.status}`,
                )
            }
        },
    },
})
