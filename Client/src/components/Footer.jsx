import Data from '@/Interface/constant/data';

// # 'Footer' Component #
const Footer = () => {
    return (
        <>
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-[15px] text-gray-600 dark:text-gray-400">
                        <span> Copyright </span>
                        <span className="text-[17px]" > &copy; </span>
                        <span> {new Date().getFullYear()} </span>
                        <span className="font-semibold text-gray-600 dark:text-gray-300"> {Data.author}. </span>
                        <span> All Rights Reserved. </span>
                    </p>
                </div>
            </footer>
        </>
    );
};

export default Footer;
