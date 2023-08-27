import type {
    Activity,
    BaseClassGroupActivity,
    ClassGroup2Activity,
    ClassGroupActivity,
} from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import type { Ref } from "vue"
import { computed } from "vue"

function getDayOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0)
    return Math.ceil(
        (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60e3),
    )
}

function getWeekOfYear(date: Date): number {
    return Math.ceil(getDayOfYear(date) / 7)
}

export enum Frequency {
    WEEKLY = "WEEKLY",
    BIWEEKLY_A = "BIWEEKLY_A",
    BIWEEKLY_B = "BIWEEKLY_B",
}

export interface Schedule {
    day: number
    startHour: number
    startMinute: number
    endHour: number
    endMinute: number
    frequency: Frequency
}

function getClassGroupSchedule(activities: Activity[]): Schedule | null {
    const classGroupActivities: BaseClassGroupActivity[] = activities.filter(
        (activity) =>
            activity.type === "classgroup" || activity.type === "classgroup2",
    ) as (ClassGroupActivity | ClassGroup2Activity)[]

    if (classGroupActivities.length < 2) {
        return null
    }

    const dayCount: Record<number, number> = {}

    let weekA = 0
    let weekB = 0

    for (const activity of classGroupActivities) {
        const startTime = new Date(activity.start_time)

        const day = startTime.getDay()
        dayCount[day] = (dayCount[day] ?? 0) + 1

        if (getWeekOfYear(startTime) % 2 === 1) {
            weekA++
        } else {
            weekB++
        }
    }

    const day = parseInt(
        Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0],
    )

    const secondStartTime = new Date(classGroupActivities[2].start_time)
    const secondEndTime = new Date(classGroupActivities[2].end_time)

    return {
        day,
        startHour: secondStartTime.getHours(),
        startMinute: secondStartTime.getMinutes(),
        endHour: secondEndTime.getHours(),
        endMinute: secondEndTime.getMinutes(),
        frequency:
            classGroupActivities.length >= 14
                ? Frequency.WEEKLY
                : weekA > weekB
                ? Frequency.BIWEEKLY_A
                : Frequency.BIWEEKLY_B,
    }
}

export function useClassGroupSchedule(
    unitId: Ref<string>,
    groupNumber: Ref<number>,
) {
    const usosStore = useUsosStore()

    const activities = computed(
        () => usosStore.classGroupDates[unitId.value]?.[groupNumber.value],
    )

    return computed(() => {
        if (activities.value === undefined) {
            return null
        }

        return getClassGroupSchedule(activities.value)
    })
}
