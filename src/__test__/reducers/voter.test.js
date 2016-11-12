import store from '../../reducers/reducers';
import serverActions from '../../actions/act-voter-server';
import clientActions from '../../actions/act-voter-client';

function getVoter() {
    return store.getState().voter;
}

describe('voter should work', () => {
    it('should load data properly', () => {
        let oneRace = [
            {id: "0", name: 'First', candidates: [
                {name: 'Simple Candidate', voters: ['stan', 'kyle']}
            ]}
        ];
        store.dispatch(serverActions.refresh(oneRace));

        expect(getVoter()).toEqual({
            activeRace: "0", races: oneRace
        });
    });

    it('should be able to add a new race', () => {
        store.dispatch(serverActions.newRace('Second'));
        expect(getVoter().races[1]).toEqual({
            id: "1",
            name: 'Second',
            candidates: []
        });
    });

    it('should be able to remove a race', () => {
        store.dispatch(serverActions.removeRace('1'));
        expect(getVoter().races.length).toEqual(1);
        expect(getVoter().races[0].name).not.toEqual('Second');
    });

    it('should be able to switch races', () => {
        store.dispatch(serverActions.newRace('New Second'));
        store.dispatch(clientActions.switchRace('3'));
        expect(getVoter().activeRace).toEqual('3');
    });

    it('should be able to add candidates', () => {
        store.dispatch(serverActions.newCandidate('0', 'Fresh Candidate'));
        expect(getVoter().races[0].candidates[1]).toEqual({
            name: 'Fresh Candidate',
            voters: []
        });
    });

    it('should have working voting', () => {
        function didStanVote() {
            return getVoter().races[0].candidates[0].voters.indexOf('stan') !== -1;
        }
        store.dispatch(serverActions.toggleVote('0', 'Simple Candidate', 'stan'));
        expect(didStanVote()).toEqual(false);
        store.dispatch(serverActions.toggleVote('0', 'Simple Candidate', 'stan'));
        expect(didStanVote()).toEqual(true);
    });
});