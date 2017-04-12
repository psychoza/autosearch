function autoSearch(delay, minimumCharacters) {
    var self = this;

    self.photoQuery = 'https://jsonplaceholder.typicode.com' + '/photos'; // 5000 records 
    self.postQuery = 'https://jsonplaceholder.typicode.com' + '/posts'; // 100 records

    self.isPostQuery = ko.observable(true);
    self.queryURL = ko.observable(self.postQuery);

    self.delayToSearch = delay || 500; // time in ms
    self.minimumCharactersToSearch = minimumCharacters || 3;
    self.isLoading = ko.observable(false);
    self.lastFilterValue = ko.observable('');
    self.selectedExample = ko.observable(null);
    self.exampleDataSet = ko.observableArray([]);
    self.entireDataSet = ko.observableArray([]);
    self.filterValue = ko.observable();
    self.throttledFilteredValue = ko.computed(self.filterValue).extend({ throttle: self.delayToSearch });
    self.throttledFilteredValue.subscribe(function (newValue) {
        if (!self.lastFilterValue().startsWith(newValue))
            self.selectedExample(null);
        if (newValue.trim().length >= self.minimumCharactersToSearch) {
            self.getExampleData(newValue.trim());            
        } else {
            self.exampleDataSet([]);
            self.selectedExample(null);
            //hidden.vendorListUpdated(false);
        }
        self.lastFilterValue(newValue.trim());
    });

    self.getExampleData = function(searchText) {
        self.isLoading(true);

        $.ajax({
            url: self.queryURL(),
            method: 'GET'
        }).then(function(data) {
            var filteredSet = data.where(function(record) { return record.title.includes(searchText); });
            self.exampleDataSet(filteredSet.select(function(record){ return record.title; }));
        }).always(function(){
            self.isLoading(false);
        });
    };

    self.allExampleData = function() {
        self.isLoading(true);

        $.ajax({
            url: self.queryURL(),
            method: 'GET'
        }).then(function(data) {
            self.entireDataSet(data.select(function(record){ return record.title; }));
            $( "#exampleSelect" ).combobox();
        }).always(function(){
            self.isLoading(false);
        });
    };

    self.toggleThatQuery = function(){
        if (self.isPostQuery()) {
            self.queryURL(self.photoQuery);
            self.allExampleData();
        } else {
            self.queryURL(self.postQuery);
            self.allExampleData();
        }

        self.isPostQuery(!self.isPostQuery());
    }

    self.getExampleData();
    self.allExampleData();

    return self;
}