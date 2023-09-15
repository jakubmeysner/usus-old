import type { Activity, ClassGroup2Activity, ClassGroupActivity } from "@/stores/usos"
import { useUsosStore } from "@/stores/usos"
import { mode } from "@/utils/mode"
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
    secondActivity: ClassGroupActivity | ClassGroup2Activity
}

export function getClassGroupSchedule(activities: Activity[]): Schedule | null {
    const classGroupActivities = activities.filter(
        (activity) =>
            activity.type === "classgroup" || activity.type === "classgroup2",
    ) as (ClassGroupActivity | ClassGroup2Activity)[]

    if (classGroupActivities.length < 2) {
        return null
    }

    return {
        day: mode(
            classGroupActivities.map((a) => new Date(a.start_time).getDay()),
        )!,
        startHour: mode(
            classGroupActivities.map((a) => new Date(a.start_time).getHours()),
        )!,
        startMinute: mode(
            classGroupActivities.map((a) =>
                new Date(a.start_time).getMinutes(),
            ),
        )!,
        endHour: mode(
            classGroupActivities.map((a) => new Date(a.end_time).getHours()),
        )!,
        endMinute: mode(
            classGroupActivities.map((a) => new Date(a.end_time).getMinutes()),
        )!,
        frequency:
            classGroupActivities.length >= 10
                ? Frequency.WEEKLY
                : mode(
                    classGroupActivities.map(
                        (a) => getWeekOfYear(new Date(a.start_time)) % 2,
                    ),
                ) === 1
                    ? Frequency.BIWEEKLY_A
                    : Frequency.BIWEEKLY_B,
        secondActivity: classGroupActivities[2],
    }
}

export function getClassGroupSchedules(activities: Activity[]): Schedule[] | null {
    const groupedActivities: Record<string, Activity[]> = {
        undefined: [],
    }

    for (const activity of activities) {
        if (activity.type === "classgroup" || activity.type === "classgroup2") {
            if (activity.cgwm_id != null) {
                if (!(activity.cgwm_id in groupedActivities)) {
                    groupedActivities[activity.cgwm_id] = [activity]
                } else {
                    groupedActivities[activity.cgwm_id].push(activity)
                }
            } else {
                groupedActivities.undefined.push(activity)
            }
        } else {
            groupedActivities.undefined.push(activity)
        }
    }

    return Object.values(groupedActivities)
        .map((activities) => getClassGroupSchedule(activities))
        .filter((schedule): schedule is Schedule => schedule !== null)
}

export function useClassGroupSchedules(
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

        return getClassGroupSchedules(activities.value)
    })
}
