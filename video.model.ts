    export interface Votes {
        ups: Array<string>;
        downs: Array<string>;
    }

    export interface VideoRef {
        link: string;
        date: string;
    }

    export interface VideoRequest {
        votes: Votes;
        video_ref: VideoRef;
        target_level: string;
        status: string;
        _id: string;
        author_name: string;
        author_email: string;
        topic_title: string;
        topic_details: string;
        expected_result: string;
        submit_date: string;
        update_date: string;
        __v: number;
    }

