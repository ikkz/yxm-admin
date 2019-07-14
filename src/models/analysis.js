import urls from '../urls'
import moment from 'moment';

const oneDay = 24 * 60 * 60;

export default {
    namespace: 'analysis',
    state: {
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
        range: [],
        readlogs: []
    },
    effects: {
        *queryCounts({ payload }, { call, put }) {
            function* getCount(time) {
                const now = Date.now() / 1000;
                let res = yield call(fetch, urls.count, {
                    method: 'post',
                    body: JSON.stringify({
                        begin: parseInt(now - time),
                        end: parseInt(now)
                    })
                });
                if (res.ok) {
                    let rj = yield res.json();
                    if (rj.code === 0) {
                        return rj.data;
                    }
                }
                return 0;
            }

            yield put({
                type: 'setCounts',
                payload: {
                    todayCount: yield getCount(oneDay),
                    weekCount: yield getCount(oneDay * 7),
                    monthCount: yield getCount(oneDay * 30)
                }
            });
        },
        *queryReadlogs({ payload }, { call, put }) {
            const { range } = payload;
            yield put({
                type: 'setRange',
                payload: range
            });
            let res = yield call(fetch, urls.readlogs, {
                method: 'post',
                body: JSON.stringify({
                    begin: parseInt(Date.parse(range[0]) / 1000),
                    end: parseInt(Date.parse(range[1]) / 1000)
                })
            });
            if (res.ok) {
                let rj = yield res.json();
                console.log(rj);
                if (rj.code === 0) {
                    yield put({
                        type: 'setReadlogs',
                        payload: rj.data
                    });
                }
            }
        }
    },
    reducers: {
        setCounts(state, { payload: newCounts }) {
            const newReadlogs = state.readlogs.concat([]);
            return {
                ...state,
                ...newCounts,
                readlogs: newReadlogs
            };
        },
        setReadlogs(state, { payload: newReadlogs }) {
            return {
                ...state,
                readlogs: newReadlogs
            };
        },
        setRange(state, { payload: range }) {
            return {
                ...state,
                range: range
            };
        }
    }
}