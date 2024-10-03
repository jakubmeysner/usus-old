interface ParticipantCount {
    count: number
    limit: number
}

async function fetchParticipantCount(
    unitId: number,
    groupNumber: number,
): Promise<ParticipantCount> {
    const response = await fetch(
        `https://old.usus.jakmey.com/.netlify/functions/participant-count?unitId=${unitId}&groupNumber=${groupNumber}`,
    )

    if (response.status !== 200) {
        throw new Error(`Received ${response.status} response status code`)
    }

    return await response.json()
}

async function getParticipantCount(
    unitId: number,
    groupNumber: number,
): Promise<ParticipantCount> {
    let lastError = null

    for (let i = 0; i < 3; i++) {
        try {
            return fetchParticipantCount(unitId, groupNumber)
        } catch (error) {
            lastError = error
        }
    }

    throw lastError
}

interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
    const request: Request = context.request
    const url = new URL(request.url)

    const unitId = Number(url.searchParams.get("unitId"))
    const groupNumber = Number(url.searchParams.get("groupNumber"))

    const participantCount = await getParticipantCount(unitId, groupNumber)

    return new Response(participantCount)
}
